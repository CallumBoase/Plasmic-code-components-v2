export const HelloWorld = ({name, className} : { name: string, className: any}) => {
  return (
    <div className={className}>HelloWorld {name}</div>
  )
}