import {readPackageUpAsync} from 'read-pkg-up';
import alfredNotifier from 'alfred-notifier';

export default async function updateNotification() {
	const {package: pkg} = await readPackageUpAsync();
	const alfy = (pkg || {}).alfy || {};

	if (alfy.updateNotification !== false) {
		alfredNotifier();
	}
}
