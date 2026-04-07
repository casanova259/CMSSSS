export const validateRollNo = (rollNo) => {
  const regex = /^UNI\d{7}$/;
  return regex.test(rollNo);
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^\d{10}$/;
  return regex.test(phone);
};

export const validateAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) > 0;
};
