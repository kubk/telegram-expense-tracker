export function isValidEnumValue<T extends object>(
  param: unknown,
  environments: T
): param is keyof T {
  return !(
    typeof param !== 'string' || !Object.keys(environments).includes(param)
  );
}
