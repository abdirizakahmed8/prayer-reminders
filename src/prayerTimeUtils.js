import moment from 'moment-timezone';

export const isUpcomingPrayer = (currentPrayerTime, nextPrayerTime, timeZone, prevDay = false) => {
	if (!timeZone) return false;
	const now = moment().tz(timeZone);
	const currentDate = now.format('YYYY-MM-DD');
	let prevTime = moment.tz(`${currentDate} ${currentPrayerTime}`, 'YYYY-MM-DD HH:mm', timeZone);
	let currentTime = moment.tz(`${currentDate} ${nextPrayerTime}`, 'YYYY-MM-DD HH:mm', timeZone);
	if (prevDay) {
		currentTime = moment.tz(`${currentDate} ${nextPrayerTime}`, 'YYYY-MM-DD HH:mm', timeZone).add(1, 'day');
	}
	let result = now.isBetween(prevTime, currentTime, null, '[)');
	return result ? 'prayerTimeHighlight' : 'prayerTime';
}

export function capitalizeFirstLetter(str) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function getLatLon(cityName, countryName) {
	const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)},${encodeURIComponent(countryName)}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.length > 0) {
			let city = data[0].display_name.split(',')[0].trim();
			let country = data[0].display_name.split(',').pop().trim();
			return { lat: data[0].lat, lon: data[0].lon, city: city, country: country, display_name: data[0].display_name };
		}
		return false
	} catch(err) {
		throw err
	}
}

export async function getPrayerTimes(city, country, lat, lon, day, month, year = 2024) {
	day--
	let url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lon}`;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			const unavaliableData = await response.json();
			throw new Error(`Code: ${unavaliableData.code} | Status: ${unavaliableData.status} | Reason: ${unavaliableData.data}`);
		}
		const data = await response.json();
		let prayerTimesTimings = data["data"][day].timings;
		Object.keys(prayerTimesTimings).forEach(key => {
			prayerTimesTimings[key] = prayerTimesTimings[key].slice(0, 5);
		});
		let prayerTimesDate = data["data"][day].date;
		let prayerTimesMeta = data["data"][day].meta;
		const ordinalIndicator = (n) => {
			n = parseInt(n).toString()
			if (n.slice(-1) == 1) {
				return n + 'st'
			} else if (n.slice(-1) == 2) {
				return n + 'nd'
			} else if (n.slice(-1) == 3) {
				return n + 'rd'
			} else {
				return n + 'th'
			}
		}
		return {
			timings: {
				...prayerTimesTimings
			},
			date: {
				gregorian: {
					weekday: prayerTimesDate.gregorian.weekday.en,
					day: ordinalIndicator(prayerTimesDate.gregorian.day),
					month: prayerTimesDate.gregorian.month.en,
					year: prayerTimesDate.gregorian.year
				},
				hijri: {
					weekday: prayerTimesDate.hijri.weekday.en,
					day: ordinalIndicator(prayerTimesDate.hijri.day),
					month: prayerTimesDate.hijri.month.en,
					year: prayerTimesDate.hijri.year
				}
			},
			meta: {
				location: {
					city: city,
					country: country,
					coordinates: {
						latitude: prayerTimesMeta.latitude,
						longitude: prayerTimesMeta.longitude
					}
				},
				method: {
					name: prayerTimesMeta.method.name,
					params: { ...prayerTimesMeta.method.params }
				},
				offsets: prayerTimesMeta.offset
			}
		}
	} catch (err) {
		throw err
	}
}

export async function getHadith() {
	const books = ['bukhari', 'muslim', 'abudawud', 'ibnmajah', 'tirmidhi']
	const book = books[Math.floor(Math.random() * books.length)]
	const url = `https://random-hadith-generator.vercel.app/${book}`
	try {
		const response = await fetch(url);
		const data = await response.json();
		data.data.hadith_english = data.data.hadith_english.replace(/\n/g, ' ');
		if (data.data.hadith_english.length > 230) {
			let splitIndex = data.data.hadith_english.indexOf(' ', 230);
			if (splitIndex === -1) {
				splitIndex = 230;
			}
			data.data.hadith_english_remaining = data.data.hadith_english.slice(splitIndex);
			data.data.hadith_english = data.data.hadith_english.slice(0, splitIndex) + '...';
		}
		data.data.bookName = data.data.bookName.replace(/\n/g, '');
		data.data.header = data.data.header.replace(/\n/g, '');
		return data.data
	} catch (error) {
		throw error;
	}
}

export async function getTimeZoneFromLatLon(lat, lon) {
	const API_KEY = 'DAUEWLCYV2VA';
	const url = `https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Error: ${response.status}`);
		}

		const data = await response.json();
		let timeZone = data.zoneName;
		let [area, subArea] = timeZone.split('/');
		timeZone = `${area}/${subArea}`

		return timeZone;
	} catch (error) {
		throw error;
	}
}

