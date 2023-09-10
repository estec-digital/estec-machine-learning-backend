// eslint-disable-next-line
module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>', 'src'],
  moduleNameMapper: {
    '~aws_resources/(.*)': '<rootDir>/src/aws_resources/$1',
    '~core/(.*)': '<rootDir>/src/core/$1',
    '~data/(.*)': '<rootDir>/src/data/$1',
    '~functions/(.*)': '<rootDir>/src/functions/$1',
    '~services/(.*)': '<rootDir>/src/services/$1',
    '~shared/(.*)': '<rootDir>/src/shared/$1',
    '~tests/(.*)': '<rootDir>/src/tests/$1',
    '~root/(.*)': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'src/tests/_result',
  testTimeout: 30000,
}
