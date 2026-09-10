process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = process.env.SNIPEIT_API_URL;
const TOKEN = process.env.SNIPEIT_API_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function getAssets() {
  const limit = 500;
  let offset = 0;
  let allAssets: any[] = [];
  let total = 0;

  while (true) {
    const response = await fetch(
      `${BASE_URL}/hardware?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Snipe-IT API error: ${response.status}`
      );
    }

    const data = await response.json();

    total = data.total ?? 0;

    allAssets = [
      ...allAssets,
      ...(data.rows ?? []),
    ];

    if (
      allAssets.length >= total ||
      (data.rows ?? []).length === 0
    ) {
      break;
    }

    offset += limit;
  }

  return {
    total,
    rows: allAssets,
  };
}

export async function getAsset(
  assetId: string
) {
  const response = await fetch(
    `${BASE_URL}/hardware/${assetId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Snipe-IT API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getUsers() {
  const limit = 500;
  let offset = 0;
  let allUsers: any[] = [];
  let total = 0;

  while (true) {
    const response = await fetch(
      `${BASE_URL}/users?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Snipe-IT API error: ${response.status}`
      );
    }

    const data = await response.json();

    total = data.total ?? 0;

    allUsers = [
      ...allUsers,
      ...(data.rows ?? []),
    ];

    if (
      allUsers.length >= total ||
      (data.rows ?? []).length === 0
    ) {
      break;
    }

    offset += limit;
  }

  return {
    total,
    rows: allUsers,
  };
}

export async function findAssetByTag(
  assetTag: string
) {
  const response = await fetch(
    `${BASE_URL}/hardware/bytag/${assetTag}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    return null;
  }

  const asset =
    await response.json();

  return asset;
}

export async function findUserByName(
  userName: string
) {
  const response = await fetch(
    `${BASE_URL}/users?search=${encodeURIComponent(
      userName
    )}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Snipe-IT API error: ${response.status}`
    );
  }

  const data =
    await response.json();

  return data.rows?.find(
    (user: any) =>
      user.name
        ?.trim()
        .toLowerCase() ===
      userName
        .trim()
        .toLowerCase()
  );
}

export async function checkoutAsset(
  assetId: number,
  userId: number,
  note: string
) {
  const response = await fetch(
    `${BASE_URL}/hardware/${assetId}/checkout`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        assigned_user: userId,
        checkout_to_type: "user",
        note,
      }),
    }
  );

  return response.json();
}