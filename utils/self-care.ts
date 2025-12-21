export type SelfCareAction = {
  id: string;
  label: string;
  bonus: number;
};

export const FOOD_ACTIONS: SelfCareAction[] = [
  { id: 'food_simple_meal', label: 'Eat a simple meal', bonus: 3 },
  { id: 'food_drink_water', label: 'Drink water', bonus: 1 },
  { id: 'food_warm_beverage', label: 'Have a warm beverage', bonus: 2 },
  { id: 'food_prepare_later', label: 'Prepare food for later', bonus: 4 },
  { id: 'food_familiar', label: 'Eat something familiar', bonus: 2 },
  { id: 'food_regular_timing', label: 'Keep regular meal timing', bonus: 3 },
  { id: 'food_sit_down', label: 'Sit down while eating', bonus: 2 },
  { id: 'food_snack', label: 'Snack when energy dips', bonus: 1 },
  { id: 'food_reduce_decisions', label: 'Reduce decision load around food', bonus: 2 },
  { id: 'food_accept_from_others', label: 'Accept food from others', bonus: 3 },
];

export const SHELTER_ACTIONS: SelfCareAction[] = [
  { id: 'shelter_rest', label: 'Rest or nap', bonus: 4 },
  { id: 'shelter_temperature', label: 'Go somewhere warm or cool', bonus: 2 },
  { id: 'shelter_tidy', label: 'Tidy a small area', bonus: 3 },
  { id: 'shelter_lighting', label: 'Adjust lighting', bonus: 2 },
  { id: 'shelter_comfortable_clothing', label: 'Change into comfortable clothing', bonus: 2 },
  { id: 'shelter_sit_lie_down', label: 'Sit or lie down intentionally', bonus: 3 },
  { id: 'shelter_quiet_space', label: 'Create a quiet space', bonus: 3 },
  { id: 'shelter_reduce_sensory', label: 'Reduce sensory input', bonus: 2 },
  { id: 'shelter_personal_space', label: 'Maintain personal space', bonus: 2 },
  { id: 'shelter_secure_belongings', label: 'Secure belongings', bonus: 1 },
];

export const CARE_ACTIONS: SelfCareAction[] = [
  { id: 'care_check_in', label: 'Check in with someone', bonus: 3 },
  { id: 'care_ask_help', label: 'Ask for help', bonus: 4 },
  { id: 'care_offer_help', label: 'Offer help', bonus: 3 },
  { id: 'care_break_no_guilt', label: 'Take a break without guilt', bonus: 3 },
  { id: 'care_breathe', label: 'Breathe slowly', bonus: 2 },
  { id: 'care_write_reflect', label: 'Write or reflect briefly', bonus: 3 },
  { id: 'care_notice_body', label: 'Notice body signals', bonus: 2 },
  { id: 'care_say_no', label: 'Say no to a request', bonus: 2 },
  { id: 'care_maintain_routine', label: 'Maintain a routine', bonus: 3 },
  { id: 'care_acknowledge_effort', label: 'Acknowledge effort without judgment', bonus: 2 },
];
