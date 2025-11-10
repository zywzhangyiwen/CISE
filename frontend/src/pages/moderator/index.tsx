import { GetServerSideProps, NextPage } from "next";
import ModeratorDashboard from "../../components/moderator/ModeratorDashboard";
import { getAuthJson } from "../../utils/api";
import { getTokenFromCookieStr, decodeToken } from "../../utils/auth";
import { Article } from "../../models/Article";

type Props = { articles: Article[] };

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
    const articles: Article[] = res.map((a: any) => ({
      _id: a._id,
      title: a.title,
      authors: Array.isArray(a.authors) ? a.authors : String(a.authors || "").split(',').map(s => s.trim()),
      journal: a.source || a.journal || '',
      year: Number(a.pubyear || a.year || 0),
      doi: a.doi,
      claim: a.claim,
      evidence: a.evidence,
      status: a.moderationStatus || a.status,
    }));
    return { props: { articles } };
  } catch (e) {
    return { props: { articles: [] } };
  }
};

export default ModeratorPage;
