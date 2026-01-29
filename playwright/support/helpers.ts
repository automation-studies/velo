export function generateOrderCode(prefix = 'VLO') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
  
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return `${prefix}-${randomPart}`;
  }

  // Exemplo de uso
const order = generateOrderCode();
console.log(order); // ex: VLO-K9Q2A7