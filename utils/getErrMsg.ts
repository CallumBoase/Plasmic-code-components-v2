export default function getErrMsg(e : any) {
  if(e instanceof Error) {
    return e.message
  } else if(typeof e === 'string') {
    return e
  } else {
    return 'An unknown error occured'
  }
}