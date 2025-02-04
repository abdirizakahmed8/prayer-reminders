import React from 'react';

export default function HadithInfo({ hadithObject, onClose, remainingHadith }) {
	return (
		<div className="tipModal">
			<div className="tipModal-content">
				<i class="fa-solid fa-circle-xmark" onClick={onClose}></i>
				<p>{remainingHadith}</p>
				<p>Hadith Collection: {hadithObject.book}</p>
				<p>Book Name: {hadithObject.bookName}</p>
				<p>Hadith Number: {hadithObject.id}</p>
			</div>
		</div>
	);
}