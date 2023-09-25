export const manageException = (error: any) => {
  console.error(error.message);
  return {
    error: true,
    message: error.message,
    code: error.code,
  };
};
