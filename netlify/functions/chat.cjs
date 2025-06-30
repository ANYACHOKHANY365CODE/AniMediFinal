const { OpenAI } = require("openai");

exports.handler = async function(event, context) {
  try {
    console.log("Received event:", event);
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message, context: userContext, attachment } = JSON.parse(event.body);

    // Helper functions for summarization
    function summarizeReminders(reminders) {
      if (!reminders || reminders.length === 0) return 'No reminders.';
      const overdue = reminders.filter(r => r.status === 'overdue' || (r.due_date && new Date(r.due_date) < new Date() && r.status !== 'completed')).length;
      const recurring = reminders.filter(r => r.is_recurring).length;
      return `${reminders.length} total, ${overdue} overdue, ${recurring} recurring. Most recent: "${reminders[0]?.title || reminders[0]?.description || 'N/A'}"`;
    }
    function summarizeRecords(records) {
      if (!records || records.length === 0) return 'No medical records.';
      const byType = {};
      records.forEach(r => {
        if (r.type) byType[r.type] = (byType[r.type] || 0) + 1;
      });
      const typeSummary = Object.entries(byType).map(([type, count]) => `${count} ${type}`).join(', ');
      return `${records.length} records${typeSummary ? ', ' + typeSummary : ''}. Most recent: "${records[0]?.title || 'N/A'}"`;
    }
    function summarizeLogs(logs) {
      if (!logs || logs.length === 0) return 'No logs.';
      return `${logs.length} actions in last week. Most recent: ${logs[0]?.action || logs[0]?.event || 'N/A'}`;
    }
    // Sort and select most recent 5 for each
    const reminders = (userContext.reminders || []).sort((a, b) => new Date(b.due_date || b.date) - new Date(a.due_date || a.date)).slice(0, 5);
    const records = (userContext.medical_records || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const logs = (userContext.logs || []).sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)).slice(0, 5);

    // Truncate large fields in reminders, records, logs
    function truncateField(obj, field, maxLen = 500) {
      if (obj[field] && typeof obj[field] === 'string' && obj[field].length > maxLen) {
        obj[field] = obj[field].slice(0, maxLen) + '... [truncated]';
      }
    }
    const safeReminders = reminders.map(r => {
      const copy = { ...r };
      truncateField(copy, 'description');
      return copy;
    });
    const safeRecords = records.map(r => {
      const copy = { ...r };
      truncateField(copy, 'description');
      truncateField(copy, 'extractedText');
      if (copy.files) delete copy.files;
      return copy;
    });
    const safeLogs = logs.map(l => ({ ...l }));

    // Compose context prompt
    let contextPrompt = '';
    if (userContext) {
      contextPrompt = "Here is the user's current context. Use this to answer the user's question. Use the exact data as provided. Do not omit any details. Do not mention that you have this context unless it's directly relevant to the user's question.\n\n";
      if (userContext.user?.name) {
        contextPrompt += `User's Name: ${userContext.user.name}\n`;
      }
      if (userContext.pet) {
        const { id, name, species, breed, age, gender, color, weight, notes } = userContext.pet || {};
        const petSummary = { id, name, species, breed, age, gender, color, weight, notes };
        contextPrompt += `\nActive Pet Profile:\n` + JSON.stringify(petSummary, null, 2) + '\n';
      }
      contextPrompt += `\nReminders Summary:\n${summarizeReminders(safeReminders)}\nRecent Reminders (up to 5):\n` + JSON.stringify(safeReminders, null, 2) + '\n';
      contextPrompt += `\nMedical Records Summary:\n${summarizeRecords(safeRecords)}\nRecent Medical Records (up to 5):\n` + JSON.stringify(safeRecords, null, 2) + '\n';
      contextPrompt += `\nLogs Summary:\n${summarizeLogs(safeLogs)}\nRecent Logs (up to 5):\n` + JSON.stringify(safeLogs, null, 2) + '\n';
    }

    const strictPrompt = `You are AniMedi's AI assistant. You must:
- Always use all available data from reminders, medical records, logs, and pet details to answer.
- Cross-reference reminders and medical records for every answer about medications, treatments, or appointments.
- If the user asks for a document's content, reply ONLY with the exact OCR/extracted text, no extra words or summary.
- If there is a mismatch between reminders and prescriptions, point it out clearly.
- Never hallucinate or omit details. If a field is missing, say so explicitly.
- For questions about past events, use the logs table.
- At the start of your answer, summarize all available data if the user asks for a summary.
- If you are unsure, say so and suggest the user check with a veterinarian.
`;

    const systemMessages = [
      {
        role: "system",
        content: strictPrompt + (contextPrompt || '')
      }
    ];

    const messages = [
      ...systemMessages,
      { role: 'user', content: message }
    ];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      body: JSON.stringify({ response: aiResponse })
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
};
