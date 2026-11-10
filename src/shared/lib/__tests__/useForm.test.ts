// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';

import { useForm } from '../useForm';

const TestSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  name: z.string().min(1, { message: 'Name required' }),
});

function makeSubmit(returnValue: string | null = null) {
  return vi.fn(async () => returnValue);
}

describe('useForm', () => {
  it('calls onSubmit with parsed data on a valid submit', async () => {
    const onSubmit = makeSubmit();
    const { result } = renderHook(() => useForm({ schema: TestSchema, onSubmit }));

    act(() => {
      result.current.setValue('email', 'alice@example.com');
      result.current.setValue('name', 'Alice');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.SyntheticEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: 'alice@example.com', name: 'Alice' });
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.serverError).toBeNull();
  });

  it('sets fieldErrors and skips onSubmit on an invalid submit', async () => {
    const onSubmit = makeSubmit();
    const { result } = renderHook(() => useForm({ schema: TestSchema, onSubmit }));

    await act(async () => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.SyntheticEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.email).toBeDefined();
    expect(result.current.fieldErrors.name).toBeDefined();
  });

  it('sets serverError when onSubmit returns a string', async () => {
    const onSubmit = makeSubmit('Something went wrong');
    const { result } = renderHook(() => useForm({ schema: TestSchema, onSubmit }));

    act(() => {
      result.current.setValue('email', 'alice@example.com');
      result.current.setValue('name', 'Alice');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.SyntheticEvent);
    });

    expect(result.current.serverError).toBe('Something went wrong');
  });

  it('reset clears values, fieldErrors, and serverError', async () => {
    const onSubmit = makeSubmit('err');
    const { result } = renderHook(() => useForm({ schema: TestSchema, onSubmit }));

    act(() => {
      result.current.setValue('email', 'alice@example.com');
      result.current.setValue('name', 'Alice');
    });

    await act(async () => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.SyntheticEvent);
    });

    expect(result.current.serverError).toBe('err');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({});
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.serverError).toBeNull();
  });
});
