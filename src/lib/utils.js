/**
 * Generates initials from a name string.
 * Handles single names, multiple names, and empty/null input.
 * @param {string | null | undefined} name - The full name string.
 * @returns {string} - The initials (e.g., "JD" for "John Doe", "J" for "John", "" for null).
 */
export const getInitials = (name) => {
  if (!name || typeof name !== "string") {
    return ""; // Return empty string for invalid input
  }

  const names = name.trim().split(/\s+/); // Split by whitespace

  if (names.length === 0 || names[0] === "") {
    return "";
  }

  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase(); // First letter of single name
  }

  // First letter of the first name and first letter of the last name
  return (
    names[0].charAt(0).toUpperCase() +
    names[names.length - 1].charAt(0).toUpperCase()
  );
};
