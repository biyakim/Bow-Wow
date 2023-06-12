import React, { useState, useEffect } from 'react';
import { doc, getDoc, deleteDoc, db, useCurrentUser } from '../firebase';
import styles from './CommunityDetail.module.css';
import { useHistory } from 'react-router-dom';

const CommunityDetail = (props) => {
  const [post, setPost] = useState(null);
  const postId = props.match.params.postId;
  const currentUser = useCurrentUser();
  const history = useHistory();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          console.log('게시물이 존재하지 않습니다.');
        }
      } catch (error) {
        console.log('게시물 데이터를 가져오는 중 오류가 발생했습니다.', error);
      }
    };

    fetchPost();
  }, [postId]);

  const stripTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      alert('게시물이 성공적으로 삭제되었습니다.');
      history.push('/bow'); // bow로 리디렉션
    } catch (error) {
      console.log('게시물 삭제 중 오류가 발생했습니다.', error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>{post.title}</h2>
      </div>

      <div className={styles['date-author']}>
        <p className={styles.date}>{post.date}</p>
        <p className={styles.author}>{post.author}</p>
      </div>

      <div className={styles.content}>{stripTags(post.content)}</div>

      {post.author === currentUser.displayName && (
        <button className={styles.deleteButton} onClick={() => handleDelete(post.id)}>게시물 삭제</button>
      )}
    </>
  );
};

export default CommunityDetail;
