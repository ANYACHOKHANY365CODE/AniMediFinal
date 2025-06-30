import React from 'react';
import { Stack } from 'expo-router';

export default function MedicareLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="consultation" />
      <Stack.Screen name="pet-care-guide" />
      <Stack.Screen name="records" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}