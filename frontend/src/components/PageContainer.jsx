export default function PageContainer({ children }) {
  return (
    <div className="w-full">
      <div
        className="
          w-full
          mx-auto
          px-4
          sm:px-6
          md:px-10
          lg:px-14
          xl:px-24
          2xl:px-32

          max-w-full
          sm:max-w-[640px]
          md:max-w-[900px]
          lg:max-w-[1200px]
          xl:max-w-[1500px]
          2xl:max-w-[1800px]
        "
      >
        {children}
      </div>
    </div>
  );
}
