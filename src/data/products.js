import categories from "./categories";

const nameStarters = [
  "Comet Dash", "Rainbow Sprint", "Sunny Trail", "Little Explorer", "Wonder Wheels",
  "Starlight Adventure", "Happy Hopper", "Cloud Jumper", "Brave Buddy", "Moonbeam Maker",
  "Jungle Quest", "Sparkle Parade", "Turbo Twist", "Dream Garden", "Supernova Scout",
  "Tiny Trailblazer", "Golden Giggles", "Magic Meadow", "Bright Ideas", "Adventure Club",
];

const ageBands = ["2+ years", "3+ years", "4+ years", "5+ years", "6+ years", "8+ years"];
const baseFeatures = ["Made for curious play", "Thoughtfully designed details", "A lovely gift for little explorers"];

function makeArtwork(category, productIndex, accent) {
  const secondAccent = productIndex % 2 ? "#ffd166" : "#80d9d0";
  const iconSize = 116 + (productIndex % 4) * 8;
  const tilt = (productIndex % 7) - 3;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${category.pale}"/><stop offset="1" stop-color="#fff"/></linearGradient><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="${category.color}"/></linearGradient><filter id="s" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="15" flood-color="#273b56" flood-opacity=".18"/></filter></defs><rect width="640" height="480" rx="36" fill="url(#g)"/><circle cx="${110 + (productIndex * 13) % 70}" cy="92" r="52" fill="#fff" opacity=".7"/><circle cx="542" cy="370" r="87" fill="${category.color}" opacity=".13"/><path d="M75 366q250-60 490 0" fill="none" stroke="${category.color}" stroke-width="20" stroke-linecap="round" opacity=".13"/><g filter="url(#s)" transform="rotate(${tilt} 320 250)"><rect x="194" y="126" width="252" height="254" rx="34" fill="url(#p)"/><path d="M218 158q102-53 204 0v34q-102-43-204 0z" fill="#fff" opacity=".24"/><rect x="217" y="203" width="206" height="139" rx="24" fill="#fff" opacity=".88"/><circle cx="320" cy="272" r="${iconSize / 2}" fill="${category.pale}"/><text x="320" y="309" text-anchor="middle" font-size="${iconSize}" font-family="Arial,sans-serif">${category.icon}</text><rect x="244" y="354" width="152" height="10" rx="5" fill="#fff" opacity=".82"/></g><path d="M113 172l8 17 19 2-14 12 4 19-17-9-17 9 4-19-14-12 19-2z" fill="${secondAccent}"/><circle cx="510" cy="121" r="11" fill="${category.color}"/><circle cx="535" cy="151" r="6" fill="${secondAccent}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function formatPrice(value) {
  return Math.round(value / 10) * 10 - 1;
}

const products = categories.flatMap((category, categoryIndex) =>
  nameStarters.map((starter, index) => {
    const id = `${category.slug}-${String(index + 1).padStart(2, "0")}`;
    const salePrice = formatPrice(category.basePrice * (0.64 + ((index * 17 + categoryIndex * 11) % 77) / 100));
    const discountPercent = 10 + ((index * 7 + categoryIndex * 3) % 26);
    const originalPrice = formatPrice(salePrice / (1 - discountPercent / 100));
    const rating = Number((4.1 + ((index * 3 + categoryIndex * 5) % 9) / 10).toFixed(1));
    const name = `${starter} ${category.type}`;
    const features = [
      category.features[index % category.features.length],
      baseFeatures[index % baseFeatures.length],
      category.features[(index + 1) % category.features.length],
    ];
    const image = index === 0
      ? category.image
      : makeArtwork(category, index + categoryIndex * nameStarters.length, index % 2 ? "#ff9d72" : "#83cbea");
    const alternateImage = makeArtwork(category, index + categoryIndex * nameStarters.length + 401, "#ffbd4a");

    return {
      id,
      name,
      category: category.name,
      description: `${name} brings ${category.name.toLowerCase()} fun to playtime. A colourful, thoughtfully designed choice for curious kids and memorable adventures.`,
      features,
      specifications: {
        "Recommended age": category.age,
        Material: index % 2 ? "Child-safe ABS and smooth edges" : "Durable, child-friendly materials",
        "What's included": `${1 + (index % 5)} ${category.type.toLowerCase()}${index % 5 ? " pieces" : ""}`,
        "Product code": `TZ-${categoryIndex + 1}-${String(index + 1).padStart(3, "0")}`,
      },
      age: index % 6 === 0 ? category.age : ageBands[(index + categoryIndex) % ageBands.length],
      price: salePrice,
      originalPrice,
      oldPrice: originalPrice,
      discountPercent,
      rating,
      reviewCount: 18 + ((index * 37 + categoryIndex * 53) % 980),
      stock: (index * 7 + categoryIndex * 11 + 1) % 23 === 0 ? 0 : 4 + ((index * 13 + categoryIndex * 17) % 46),
      popularity: (20 - index) * 100 + categoryIndex * 13,
      createdAt: categoryIndex * 20 + index,
      badge: index === 0 ? "Bestseller" : index < 3 ? "Popular" : discountPercent > 28 ? "Great Deal" : "Play Pick",
      image,
      imageGallery: index === 0 ? [image, alternateImage, makeArtwork(category, 800 + categoryIndex, "#81cfaa")] : [image, category.image, alternateImage],
      categoryColor: category.color,
    };
  })
);

export default products;
