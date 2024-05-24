import { MayPromise } from "@edsolater/fnkit"
import { isPromise } from "util/types"

export function createNewResponse(res: Response): Response
export function createNewResponse(res: Promise<Response>): Promise<Response>
export function createNewResponse(res: MayPromise<Response>): Response | Promise<Response> {
  if (isPromise(res)) {
    return res.then(createNewResponse)
  } else {
    return new Response(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json;charset=UTF-8",
      },
    })
  }
}
