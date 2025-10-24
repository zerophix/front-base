/**
 * Jest 配置文件
 * 用于单元测试和集成测试
 */

const path = require('path');
const nextJest = require('next/jest');

// 项目根目录
const projectRoot = path.resolve(__dirname, '../../');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: projectRoot,
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // 设置根目录
  rootDir: projectRoot,
  
  // 测试环境
  testEnvironment: 'jest-environment-jsdom',
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/config/test/jest.setup.js'],
  
  // 模块路径映射（与 tsconfig.json 保持一致）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 测试匹配模式
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // 覆盖率收集配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // 忽略的路径
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  
  // 转换忽略模式
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

