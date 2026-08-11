/**
 * Formats a phone number automatically with Uzbekistan (+998) prefix and spacing:
 * +998 XX XXX XX XX
 */
export const formatPhoneNumber = (input: string): string => {
  if (!input) return '+998 ';

  // Extract digits
  let digits = input.replace(/\D/g, '');

  // If digits don't start with 998, prepend 998
  if (!digits.startsWith('998')) {
    digits = '998' + digits;
  }

  // Limit to 12 digits (998 + 9 local digits)
  digits = digits.slice(0, 12);

  let formatted = '+998';
  const rest = digits.slice(3);

  if (rest.length > 0) {
    formatted += ' ' + rest.slice(0, 2);
  }
  if (rest.length > 2) {
    formatted += ' ' + rest.slice(2, 5);
  }
  if (rest.length > 5) {
    formatted += ' ' + rest.slice(5, 7);
  }
  if (rest.length > 7) {
    formatted += ' ' + rest.slice(7, 9);
  }

  return formatted;
};
