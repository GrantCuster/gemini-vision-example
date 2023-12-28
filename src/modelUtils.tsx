export const predictImage = async (
  mimeType: string,
  imageData: string,
  prompt: string
) => {
  try {
    const response = await fetch(`/api/generateResponseToTextAndImage`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        imageData: imageData,
        mimeType: mimeType,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      const fetchError = new Error(result.error.message);
      fetchError.fetchResult = result;
      throw fetchError;
    }
  } catch (error) {
    if (error.fetchResult) {
      console.error(
        `HTTP request failed with status code ${error.fetchResult.error.code}`,
        error.fetchResult
      );
      return error.fetchResult;
    }
    return {
      error: {
        message: error.message,
      },
    };
  }
};
