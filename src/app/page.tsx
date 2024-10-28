import LinkGoogleAccountButton from "@/components/link-account-button";

export default async function Home() {
  return (
    <div className="m-auto flex h-[100vh] items-center justify-center">
      <LinkGoogleAccountButton />
    </div>
  );
}
