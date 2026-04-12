export function absorbData(inputs = []) {
  return Array.isArray(inputs)
    ? inputs.map((item, index) => ({
        id: item?.id ?? `absorb_${index + 1}`,
        absorbed_at: Date.now(),
        payload: item,
      }))
    : [];
}

if (process.argv[1] && process.argv[1].endsWith('data_absorber.js')) {
  console.log(JSON.stringify(absorbData([{ sample: true }]), null, 2));
}
