export const config = { runtime: "edge" };

export default async function handler(req) {
  return new Response(JSON.stringify({ status: "OK", hello: "world" }), {
    headers: { "content-type": "application/json" },
  });
}
