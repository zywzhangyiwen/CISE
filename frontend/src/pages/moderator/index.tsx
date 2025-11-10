import { GetServerSideProps, NextPage } from "next";
import ModeratorDashboard from "../../components/moderator/ModeratorDashboard";
import { getAuthJson } from "../../utils/api";
import { getTokenFromCookieStr, decodeToken } from "../../utils/auth";

interface ArticlesInterface {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
  moderationStatus?: string;
  analysisStatus?: string;
  [key: string]: unknown;
}

type Props = { articles: ArticlesInterface[] };

const ModeratorPage: NextPage<Props> = ({ articles }) => {
  return <ModeratorDashboard articles={articles} />;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = getTokenFromCookieStr(ctx.req.headers.cookie);
  if (!token) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  const payload = decodeToken(token);
  if (!payload || (payload.role !== 'moderator' && payload.role !== 'admin')) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  try {
    const res = await getAuthJson<any>(`/api/articles/pending`, token);
    const articles: ArticlesInterface[] = res.map((a: any) => ({
      id: a._id,
      title: a.title,
      authors: Array.isArray(a.authors) ? a.authors.join(", ") : String(a.authors || ""),
      source: a.source,
      pubyear: a.pubyear,
      doi: a.doi,
      claim: a.claim,
      evidence: a.evidence,
      moderationStatus: a.moderationStatus,
      analysisStatus: a.analysisStatus,
    }));
    return { props: { articles } };
  } catch (e) {
    return { props: { articles: [] } };
  }
};

export default ModeratorPage;
