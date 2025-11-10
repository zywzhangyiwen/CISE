import { GetServerSideProps } from "next";

// Always redirect root to the login page. This ensures users land on the
// authentication page first and avoids SSR/CSR hydration issues on the root.
export default function Home() {
  // This component should never render because we redirect in getServerSideProps.
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/auth/login',
      permanent: false,
    },
  };
};