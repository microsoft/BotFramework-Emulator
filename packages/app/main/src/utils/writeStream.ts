import { createWriteStream } from 'fs';

export interface FileWriteStream {
  write: (content: string) => void;
  end: () => void;
}

export const writeStream = (pathToFile: string) => {
  const stream = createWriteStream(pathToFile);

  const write = (content: string, newLine: boolean = true) => {
    stream.write(content);
    if (newLine) {
      stream.write('\n');
    }
  };

  const end = () => {
    stream.end();
  };

  return {
    write,
    end,
  };
};
