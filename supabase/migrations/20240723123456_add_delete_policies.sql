CREATE POLICY "Users can delete their own medical records"
ON public.medical_records
FOR DELETE
USING (auth.uid() = user_id);
 
CREATE POLICY "Users can delete their own logs"
ON public.logs
FOR DELETE
USING (auth.uid() = user_id); 