import React, { useState, useEffect } from 'react';
import { doc, getDoc, deleteDoc, db, useCurrentUser } from '../firebase';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import styles from './CommunityDetail.module.css';
import { useHistory } from 'react-router-dom';
import { storage } from '../firebase';

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

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // 이미지 업로드 및 해상도 조절
const handleImageUpload = async (file) => {
  try {
    const storageRef = ref(storage, 'images/' + file.name);
    await uploadBytes(storageRef, file);

    const imageUrl = await getDownloadURL(storageRef);

    // 해상도 조절 또는 다른 작업 수행
    const image = new Image();
    image.src = imageUrl;

    const canvas = document.createElement('canvas');
    const maxWidth = 900; // 원하는 최대 가로 크기
    const maxHeight = 600; // 원하는 최대 세로 크기

    let width = image.width;
    let height = image.height;

    // 가로 또는 세로 크기가 최대 크기를 초과하면 크기 조절
    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height *= maxWidth / width;
        width = maxWidth;
      } else {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);

    const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.8); // 압축률 조절 가능 (0.8은 80% 압축)

    return resizedImageUrl;
  } catch (error) {
    console.log('이미지 업로드 중 오류가 발생했습니다.', error);
  }
};

  // 이미지 다운로드 URL 가져오기
  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (post && post.imagePath) {
          const storageRef = ref(storage, post.imagePath);
          const imageUrl = await getDownloadURL(storageRef);
          setPost((prevPost) => ({ ...prevPost, imageUrl: imageUrl }));
        }
      } catch (error) {
        console.log('이미지를 가져오는 중 오류가 발생했습니다.', error);
      }
    };

    fetchImage();
  }, [post]);

  const stripTags = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      alert('게시물이 성공적으로 삭제되었습니다.');
      history.push('/community');
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

      <div className={styles.content}>
        {post.url && <img src={post.url} alt="Post Image" />}
        {stripTags(post.content)}
      </div>

      {post.author === currentUser.displayName && (
        <button className={styles.deleteButton} onClick={() => handleDelete(post.id)}>
          게시물 삭제
        </button>
      )}
    </>
  );
};

export default CommunityDetail;
