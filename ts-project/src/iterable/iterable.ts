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

function* take<T>(length: number, iterable: Iterable<T>) {
  const iterator = iterable[Symbol.iterator]();
  while (length-- > 0) {
    const { value, done } = iterator.next();
    if (done) break;
    yield value;
  }
}

function* chunk<T>(size: number, iterable: Iterable<T>) {
  const iterator = iterable[Symbol.iterator]();
  while (true) {
    const arr = [...take(size, { [Symbol.iterator]: () => iterator })];
    if (arr.length) yield arr;
    if (arr.length < size) break;
  }
}

function* map<A, B>(
  f: (a: A) => B,
  iterable: Iterable<A>
): IterableIterator<B> {
  for (const a of iterable) {
    yield f(a);
  }
}

async function fromAsync<T>(iterable: Iterable<Promise<T>>) {
  const arr: Awaited<T>[] = [];
  for await (const a of iterable) {
    arr.push(a);
  }
  return arr;
}

async function concurrent2<T>(limit: number, fs: (() => Promise<T>)[]) {
  const result = await fromAsync(
    map(
      (ps) => Promise.all(ps),
      map((fs) => fs.map((f) => f()), chunk(limit, fs))
    )
  );
  return result.flat();
}

class FxIterator<T> {
  constructor(public iterable: Iterable<T>) {}

  chunk(size: number) {
    return fx(chunk(size, this.iterable));
  }

  map<U>(f: (a: T) => U): FxIterator<U> {
    return fx(map(f, this.iterable));
  }

  to<U>(f: (iterable: Iterable<T>) => U): U {
    return f(this.iterable);
  }
}

function fx<T>(iterable: Iterable<T>) {
  return new FxIterator(iterable);
}

async function concurrent3<T>(limit: number, fs: (() => Promise<T>)[]) {
  return fx(fs) //
    .chunk(limit)
    .map((fs) => fs.map((f) => f()))
    .map((ps) => Promise.all(ps))
    .to(fromAsync)
    .then((arr) => arr.flat());
}

async function main() {
  console.time();
  const files = await concurrent3(3, [
    () => getFile('file1.png'),
    () => getFile('file2.ppt'),
    () => getFile('file3.pdf'),
    () => getFile('file4.jpg'),
    () => getFile('file5.gif'),
    () => getFile('file6.jpeg'),
    () => getFile('file7.png'),
  ]);

  console.log(files);

  const totalSize = files
    .filter((file) => file.name.endsWith('.png'))
    .reduce((size, file) => size + file.size, 0);
  console.log(totalSize);

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
