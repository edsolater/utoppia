export async function getPostJSONData(request: Request) {
  const postData = await request.json()
  return postData
}
