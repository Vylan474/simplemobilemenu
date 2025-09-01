export default async function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Menu Editor API is working',
    version: '2.0'
  });
}