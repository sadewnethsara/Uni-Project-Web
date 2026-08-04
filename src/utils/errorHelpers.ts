export function getErrorMessage(err: any): string {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err;

  // 1. Check if the error is a standard/custom Error instance or has a message property
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (err.message && typeof err.message === "string") {
    return err.message;
  }

  // 2. Check for common nested error properties
  if (err.error_description && typeof err.error_description === "string") {
    return err.error_description;
  }

  // 3. Recurse if there's a nested error object
  if (err.error && typeof err.error === "object") {
    return getErrorMessage(err.error);
  }
  if (err.error && typeof err.error === "string") {
    return err.error;
  }
  if (err.data && typeof err.data === "object") {
    return getErrorMessage(err.data);
  }
  if (err.data && typeof err.data === "string") {
    return err.data;
  }

  // 4. Try toString() or JSON serialization
  if (err.toString && err.toString() !== "[object Object]") {
    return err.toString();
  }

  try {
    const stringified = JSON.stringify(err);
    if (stringified && stringified !== "{}" && stringified !== '{"error":{}}') {
      return stringified;
    }
  } catch (e) {}

  return "An unexpected error occurred.";
}
