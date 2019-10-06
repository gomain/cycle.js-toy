
console.log(`xs: ${xs.periodic(1000).fold(prev => prev++,0).map( i => `${i}`).subscribe}`);

xs.periodic(1000)
  .fold(prev => prev+1,0)
  .map(i => `Seconds elapsed: ${i}`)
  .subscribe({
    next: str => { document.querySelector('#app').textContent = str; }
  });
