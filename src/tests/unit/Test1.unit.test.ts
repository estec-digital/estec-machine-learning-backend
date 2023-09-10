import * as lodash from 'lodash'

describe('[INTEGRATION] Test1', () => {
  beforeAll(async () => {
    console.log('Before test')
    console.log('process.env.TEST_VALUE: ' + process.env.TEST_VALUE)
    console.log('Hii')
  })

  afterAll(async () => {
    console.log('After test')
  })

  test('Test 1 - Integration', async () => {
    const output = 1
    const expectedOutput = 1

    expect(lodash.isEqual(output, expectedOutput)).toBe(true)
  })
})
