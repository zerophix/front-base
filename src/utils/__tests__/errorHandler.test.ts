import {
  ErrorType,
  AppError,
  ValidationError,
  NetworkError,
  BusinessError,
  ErrorHandler,
  globalErrorHandler,
  safeExecute,
  isAppError,
  isErrorOfType,
  createError,
} from '../errorHandler';

// Mock antd message
jest.mock('antd', () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock console methods
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

Object.assign(console, mockConsole);

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(
        ErrorType.VALIDATION,
        'Test error',
        'TEST_ERROR',
        400,
        { field: 'username' }
      );

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: 'username' });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('AppError');
    });

    it('should generate user-friendly message', () => {
      const validationError = new AppError(ErrorType.VALIDATION, 'Invalid input', 'VALIDATION_ERROR');
      expect(validationError.toUserMessage()).toBe('输入数据有误，请检查后重试');

      const networkError = new AppError(ErrorType.NETWORK, 'Connection failed', 'NETWORK_ERROR');
      expect(networkError.toUserMessage()).toBe('网络连接失败，请检查网络后重试');

      const authError = new AppError(ErrorType.AUTHENTICATION, 'Unauthorized', 'AUTH_ERROR');
      expect(authError.toUserMessage()).toBe('身份验证失败，请重新登录');

      const unknownError = new AppError(ErrorType.UNKNOWN, 'Unknown error', 'UNKNOWN_ERROR');
      expect(unknownError.toUserMessage()).toBe('操作失败，请稍后重试');
    });

    it('should generate log format', () => {
      const error = new AppError(
        ErrorType.SERVER,
        'Server error',
        'SERVER_ERROR',
        500,
        { userId: '123' }
      );

      const logFormat = error.toLogFormat();
      expect(logFormat).toHaveProperty('type', ErrorType.SERVER);
      expect(logFormat).toHaveProperty('message', 'Server error');
      expect(logFormat).toHaveProperty('code', 'SERVER_ERROR');
      expect(logFormat).toHaveProperty('statusCode', 500);
      expect(logFormat).toHaveProperty('context', { userId: '123' });
      expect(logFormat).toHaveProperty('timestamp');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with field and value', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid-email');

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Invalid email');
      expect(error.context).toEqual({ field: 'email', value: 'invalid-email' });
    });

    it('should create ValidationError without field and value', () => {
      const error = new ValidationError('General validation error');

      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('General validation error');
      expect(error.context).toBeUndefined();
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with URL and method', () => {
      const error = new NetworkError('Request failed', '/api/users', 'GET');

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Request failed');
      expect(error.context).toEqual({ url: '/api/users', method: 'GET' });
    });

    it('should create NetworkError without URL and method', () => {
      const error = new NetworkError('Network error');

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Network error');
      expect(error.context).toBeUndefined();
    });
  });

  describe('BusinessError', () => {
    it('should create BusinessError with context', () => {
      const error = new BusinessError('Business rule violation', 'BUSINESS_ERROR', { rule: 'max_limit' });

      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.message).toBe('Business rule violation');
      expect(error.code).toBe('BUSINESS_ERROR');
      expect(error.context).toEqual({ rule: 'max_limit' });
    });
  });

  describe('ErrorHandler', () => {
    it('should handle AppError', () => {
      const handler = new ErrorHandler();
      const error = new AppError(ErrorType.VALIDATION, 'Test error', 'TEST_ERROR');

      handler.handle(error);

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle regular Error', () => {
      const handler = new ErrorHandler();
      const error = new Error('Regular error');

      handler.handle(error);

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle string error', () => {
      const handler = new ErrorHandler();

      handler.handle('String error');

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle unknown error type', () => {
      const handler = new ErrorHandler();

      handler.handle({ unknown: 'error' });

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should respect configuration', () => {
      const handler = new ErrorHandler({
        showUserMessage: false,
        logError: false,
        reportError: false,
      });

      const error = new AppError(ErrorType.VALIDATION, 'Test error', 'TEST_ERROR');
      handler.handle(error);

      // Should not log or show message when disabled
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should add context to error', () => {
      const handler = new ErrorHandler();
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      handler.handle(error, context);

      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('safeExecute', () => {
    it('should execute function successfully', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await safeExecute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should handle function error', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      const result = await safeExecute(fn);

      expect(result).toBeNull();
      expect(fn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should use custom error handler', async () => {
      const customHandler = new ErrorHandler({ logError: false });
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await safeExecute(fn, customHandler);

      expect(result).toBeNull();
    });

    it('should handle synchronous function', async () => {
      const fn = jest.fn().mockReturnValue('sync result');
      const result = await safeExecute(fn);

      expect(result).toBe('sync result');
    });

    it('should handle synchronous function error', async () => {
      const fn = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });
      
      const result = await safeExecute(fn);

      expect(result).toBeNull();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('Type Guards', () => {
    it('should identify AppError', () => {
      const appError = new AppError(ErrorType.VALIDATION, 'Test', 'TEST');
      const regularError = new Error('Regular error');
      const notError = 'not an error';

      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
      expect(isAppError(notError)).toBe(false);
    });

    it('should identify error of specific type', () => {
      const validationError = new AppError(ErrorType.VALIDATION, 'Test', 'TEST');
      const networkError = new AppError(ErrorType.NETWORK, 'Test', 'TEST');
      const regularError = new Error('Regular error');

      expect(isErrorOfType(validationError, ErrorType.VALIDATION)).toBe(true);
      expect(isErrorOfType(validationError, ErrorType.NETWORK)).toBe(false);
      expect(isErrorOfType(networkError, ErrorType.NETWORK)).toBe(true);
      expect(isErrorOfType(regularError, ErrorType.VALIDATION)).toBe(false);
    });
  });

  describe('Error Creators', () => {
    it('should create validation error', () => {
      const error = createError.validation('Invalid input', 'email', 'invalid@');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.message).toBe('Invalid input');
    });

    it('should create network error', () => {
      const error = createError.network('Connection failed', '/api/test', 'POST');

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Connection failed');
    });

    it('should create business error', () => {
      const error = createError.business('Business rule violated', 'BUSINESS_ERROR', { rule: 'test' });

      expect(error).toBeInstanceOf(BusinessError);
      expect(error.message).toBe('Business rule violated');
      expect(error.code).toBe('BUSINESS_ERROR');
    });

    it('should create auth error', () => {
      const error = createError.auth();

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.statusCode).toBe(401);
    });

    it('should create forbidden error', () => {
      const error = createError.forbidden();

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.statusCode).toBe(403);
    });

    it('should create not found error', () => {
      const error = createError.notFound();

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });

    it('should create server error', () => {
      const error = createError.server();

      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.SERVER);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Global Error Handler', () => {
    it('should use global error handler', () => {
      const error = new Error('Global test error');

      globalErrorHandler.handle(error);

      expect(mockConsole.error).toHaveBeenCalled();
    });
  });
});