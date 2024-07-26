import {readPackageUp} from 'read-package-up';
import alfredNotifier from 'alfred-notifier';

export default async function updateNotification() {
	const {package: package_} = await readPackageUp();
	const alfy = package_?.alfy ?? {};

	if (alfy.updateNotification !== false) {
		alfredNotifier();
	}
}
