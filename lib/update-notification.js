import {readPackageUp} from 'read-package-up';
import alfredNotifier from 'alfred-notifier';

export default async function updateNotification() {
	const {package: pkg} = await readPackageUp();
	const alfy = (pkg || {}).alfy || {};

	if (alfy.updateNotification !== false) {
		alfredNotifier();
	}
}
