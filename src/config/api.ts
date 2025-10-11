// API Configuration for backend integration
const BACKEND_MODE = process.env.NEXT_PUBLIC_BACKEND_MODE || 'PRODUCTION';

interface ApiConfig {
  baseUrl: string;
}

const getApiConfig = (): ApiConfig => {
  switch (BACKEND_MODE) {
    case 'PRODUCTION':
      return {
        baseUrl: 'https://eliza-backend-production-4791.up.railway.app'
      };
    case 'DEVELOPMENT_LOCAL':
    default:
      return {
        baseUrl: 'http://localhost:3000'
      };
  }
};

export const apiConfig = getApiConfig();

// Helper function to get the message endpoint
export const getMessageUrl = () => {
  return `${apiConfig.baseUrl}/message`;
};
