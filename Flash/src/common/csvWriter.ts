import file from "k6/x/file";

class CSVWriter {
    private fileName: string;
    private columnNames: string[] | null = null;
  
    constructor(fileName: string) {
      this.fileName = fileName;
    }
  
    write(object: {[key: string]: any}) {
      if (!this.columnNames) {
        this.columnNames = Object.keys(object);
        file.appendString(this.fileName, this.columnNames.join(',') + '\n');
      }
  
      const csvRow = this.columnNames.map(col => object[col] ?? '').join(',');
      file.appendString(this.fileName, csvRow + '\n');
    }
  }
  
  export default CSVWriter;