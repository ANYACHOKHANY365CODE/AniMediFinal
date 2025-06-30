let chatHistory = [];

exports.handler = async function(event, context) {
  // Optionally filter by user_id and pet_id if provided
  // (In-memory demo: always return the same array)
  return {
    statusCode: 200,
    body: JSON.stringify({ history: chatHistory })
  };
}; 