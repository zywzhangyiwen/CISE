import React from 'react';
import { GetServerSideProps } from 'next';
import { getTokenFromCookieStr, decodeToken, TOKEN_COOKIE } from '../../utils/auth';
import { getAuthJson } from '../../utils/api';
import { API_BASE_URL } from '../../utils/api';
import styles from './my-moderation.module.scss';

type Article = {
  _id: string;
  title: string;
  moderationStatus: string;
  submissionDate?: string;
};

type Props = {
  notifications: Article[];
  pendingQueue: Article[];
};

export default function MyModerationPage({ notifications, pendingQueue }: Props) {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.header}>My Submissions & Reviews</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Review Notifications</h2>
        {notifications.length === 0 ? (
          <p className={styles.emptyMessage}>No review notifications</p>
        ) : (
          <ul className={styles.list}>
            {notifications.map((a) => (
              <li key={a._id} className={styles.listItem}>
                <span className={styles.itemContent}>{a.title}</span>
                <span className={styles.itemStatus}>Status: {a.moderationStatus}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pending Review Queue (My Submissions)</h2>
        {pendingQueue.length === 0 ? (
          <p className={styles.emptyMessage}>No submissions pending review</p>
        ) : (
          <ul className={styles.list}>
            {pendingQueue.map((a) => (
              <li key={a._id} className={styles.listItem}>
                <span className={styles.itemContent}>{a.title}</span>
                <span className={styles.itemDate}>
                  Submission Time: {a.submissionDate ? new Date(a.submissionDate).toLocaleString() : 'Unknown'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookieStr = ctx.req.headers.cookie;
  const token = getTokenFromCookieStr(cookieStr);

  // 未登录 -> 跳转到登录页
  if (!token) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const payload = decodeToken(token);
  if (!payload) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  // moderators/admins should go to moderator dashboard instead
  if (payload.role === 'moderator' || payload.role === 'admin') {
    return {
      redirect: {
        destination: '/moderator',
        permanent: false,
      },
    };
  }

  try {
    // fetch user's submissions from backend
    const url = `${API_BASE_URL}/api/articles/mine`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // no-store to make sure we see latest
      cache: 'no-store',
    });
    if (!res.ok) {
      // If unauthorized, redirect to login
      if (res.status === 401) {
        return {
          redirect: {
            destination: '/auth/login',
            permanent: false,
          },
        };
      }
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const articles: Article[] = await res.json();

    const notifications = articles.filter((a) => a.moderationStatus !== 'pending');
    const pendingQueue = articles.filter((a) => a.moderationStatus === 'pending');

    return {
      props: {
        notifications,
        pendingQueue,
      },
    };
  } catch (err) {
    // On error, still render an empty page with a message
    return {
      props: {
        notifications: [],
        pendingQueue: [],
      },
    };
  }
};