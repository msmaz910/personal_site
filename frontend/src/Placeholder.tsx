/** Stand-in page body until real content arrives in E4. */
function Placeholder({ title }: { title: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </>
  )
}

export default Placeholder
