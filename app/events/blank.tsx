import { StatTile } from "~/components/StatTile"
export default function Blank() {
  return(
    <>
    {/* Stats */}
      <div className="mb-8 flex flex-row w-full justify-evenly gap-4">
          <StatTile label="Arrived" value={21} tone="brand" />
          <StatTile label="Not Arrived" value={21} tone="accent" />
          <StatTile label="Exited" value={21} tone="neutral" />
      </div>
    </>
  )
}