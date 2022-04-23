export function isValidEnumValue<T extends object>(
  param: unknown,
  environments: T
): param is T[keyof T] {
  return !(
    typeof param !== 'string' || !Object.values(environments).includes(param)
  );
}
