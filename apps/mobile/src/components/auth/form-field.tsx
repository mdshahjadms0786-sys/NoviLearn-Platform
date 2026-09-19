'use client';

import type {
  Control,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { TextInputProps } from 'react-native';

import { Input } from '../ui/input';

interface AuthFormFieldProps<T extends FieldValues> extends Omit<
  UseControllerProps<T>,
  'name' | 'control' | 'render' | 'rules'
> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
}

export function AuthFormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  autoComplete,
}: AuthFormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <Input
          label={label}
          {...(placeholder ? { placeholder } : {})}
          {...(secureTextEntry !== undefined ? { secureTextEntry } : {})}
          {...(autoCapitalize !== undefined ? { autoCapitalize } : {})}
          {...(keyboardType !== undefined ? { keyboardType } : {})}
          {...(autoComplete !== undefined ? { autoComplete } : {})}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          onBlur={onBlur}
          {...(fieldState.error?.message
            ? { error: fieldState.error.message }
            : {})}
        />
      )}
    />
  );
}
