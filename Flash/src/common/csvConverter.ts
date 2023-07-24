export function convertToCSV(arr: any[]) {
    const array = [Object.keys(arr[0])].concat(arr);
  
    return array
      .map((it) => {
        return Object.values(it)
          .map((value) => `"${value}"`)
          .join(",");
      })
      .join("\n");
  }