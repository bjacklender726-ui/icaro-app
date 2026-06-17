import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY';

export const initEmailJS = () => {
  if (EMAILJS_PUBLIC_KEY !== 'TU_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
};

export const sendCredentialsEmail = async (toEmail, toName, username, password) => {
  if (EMAILJS_SERVICE_ID === 'TU_SERVICE_ID') {
    console.log('EmailJS no configurado. Credenciales:', { toEmail, username, password });
    return { success: true, mocked: true };
  }
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: toName,
      username,
      password,
      app_name: 'ICARO',
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};
