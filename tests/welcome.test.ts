import Welcome from '../src';

// Test hello method from welcome class
test('Welcome.hello', async () => {
  const welcome = await Welcome.hello();
  expect(welcome).toBe('hello');
});
