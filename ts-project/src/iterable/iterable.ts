function delay<T>(time: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), time));
}

interface IFile {
  name: string;
  body: string;
  size: number;
}

function getFile(name: string): Promise<IFile> {
  console.log(name);
  return delay(1000, { name, body: '...', size: 100 });
}

async function concurrent<T>(limit: number, fs: (() => Promise<T>)[]) {
  const result: T[][] = [];
  for (let i = 0; i < fs.length / limit; i++) {
    const tmp: Promise<T>[] = [];
    for (let j = 0; j < limit; j++) {
      const f = fs[i * limit + j];
      if (f) tmp.push(f());
    }
    result.push(await Promise.all(tmp));
  }
  return result.flat();
}

async function main() {
  console.time();
  const files = await concurrent(2, [
    () => getFile('file1.png'),
    () => getFile('file2.ppt'),
    () => getFile('file3.pdf'),
    () => getFile('file4.jpg'),
    () => getFile('file5.gif'),
    () => getFile('file6.jpeg'),
  ]);
  console.log(files);
  console.timeEnd();
}

main();

/**
 * Promise.race()
 * n개의 Promise를 전달했을 때 제일 먼저 완료된 Promise의 결과만 반환
 * - 사용자의 네트워크 상황에 따라 다른 응답을 줘야할 때
 */

async function promiseRace() {
  const result = await Promise.race([
    getFile('file1.png'),
    delay(4000, 'timeout'),
  ]);

  if (result === 'timeout') {
    console.log('네트워크 환경을 확인해주세요');
  } else {
    console.log(result);
  }
}

async function promiseRace2() {
  const file = getFile('file1.png');
  const result = await Promise.race([file, delay(1000, 'timeout')]);

  if (result === 'timeout') {
    console.log('Loading...');
    console.log(await file);
  } else {
    console.log('Render!!');
  }
}
