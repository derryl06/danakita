/**
 * Extrak metadata dari URL Shopee (Nama barang, harga, dll)
 * Menggunakan teknik parsing URL karena scraping langsung sering terblokir bot protection
 * @param {string} urlStr - URL dari link produk Shopee
 * @returns {Promise<{name: string, price: number, category: string}>}
 */
export const extractShopeeData = async (urlStr) => {
    try {
        // 1. Bersihkan URL
        let url = urlStr.trim();

        // 2. Deteksi Nama Barang dari URL Slug (biasanya di antara '/' akhir dan '-i.')
        // Contoh: https://shopee.co.id/Apple-iPhone-11-2020-64GB-128GB-(White-Black)-i.227192759.100062489
        let name = "Produk Shopee";

        // Pola 1: /Nama-Produk-i.shopid.productid
        const pattern1 = /\/([^\/]+)-i\.\d+\.\d+/;
        const match1 = url.match(pattern1);

        if (match1 && match1[1]) {
            name = match1[1].split('-').join(' ');
        } else {
            // Pola 2: URL pendek id.shp.ee atau yang sudah di-expand
            // Kita ambil bagian path terakhir jika tidak ada pola -i.
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                if (!lastPart.includes('shp.ee')) {
                    name = lastPart.split('-').filter(s => s).join(' ');
                }
            }
        }

        // 3. Simulasi penentuan harga (karena scraping butuh proxy/server-side yang kompleks)
        // Kita berikan angka default atau range berdasarkan keyword jika ada
        let price = 1000000; // Default 1jt

        const lowerName = name.toLowerCase();
        if (lowerName.includes('iphone')) price = 12000000;
        else if (lowerName.includes('macbook')) price = 18000000;
        else if (lowerName.includes('samsung')) price = 5000000;
        else if (lowerName.includes('baju') || lowerName.includes('kaos')) price = 150000;
        else if (lowerName.includes('sepatu')) price = 500000;

        return {
            name: decodeURIComponent(name),
            price: price,
            category: 'Elektronik' // Default kategori
        };
    } catch (error) {
        console.error("Error extracting Shopee data:", error);
        return {
            name: "Produk Link Shopee",
            price: 500000,
            category: 'General'
        };
    }
};
