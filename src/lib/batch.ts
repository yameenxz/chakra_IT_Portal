export function getCurrentBatchName() {
  const today = new Date();

  const day = today.getDate();

  let batchMonth = today.getMonth();
  let batchYear = today.getFullYear();

  if (day < 15) {
    batchMonth -= 1;

    if (batchMonth < 0) {
      batchMonth = 11;
      batchYear -= 1;
    }
  }

  const monthName = new Date(
    batchYear,
    batchMonth
  ).toLocaleString("en-US", {
    month: "long",
  });

  return `${monthName} ${batchYear}`;
}